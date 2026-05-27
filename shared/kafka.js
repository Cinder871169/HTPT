const { Kafka } = require("kafkajs");
const constants = require("./constants");
const winston = require("./logger");

// Tạo logger riêng cho Kafka
const logger = winston.createLogger
  ? winston.createLogger("kafka-shared")
  : console;

const kafkaConfig = {
  clientId: constants.KAFKA.CLIENT_ID,
  brokers: constants.KAFKA.BROKERS,
  retry: {
    initialRetryTime: 1000,
    retries: 10,
  },
};

// Cấu hình SASL/SSL Cloud Kafka
if (process.env.KAFKA_USERNAME && process.env.KAFKA_PASSWORD) {
  kafkaConfig.ssl = true;
  kafkaConfig.sasl = {
    mechanism: process.env.KAFKA_SASL_MECHANISM || "scram-sha-256",
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  };
}

const kafka = new Kafka(kafkaConfig);

let producer = null;

/**
 * Khởi tạo và kết nối Kafka Producer
 */
async function connectProducer() {
  if (producer) return producer;

  producer = kafka.producer();
  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      logger.info(`Connecting Kafka Producer (Attempt ${retryCount + 1}/${maxRetries})...`);
      await producer.connect();
      logger.info("✅ Kafka Producer connected successfully.");
      return producer;
    } catch (error) {
      retryCount++;
      logger.error(`❌ Failed to connect Kafka Producer (Attempt ${retryCount}/${maxRetries}):`, error);
      if (retryCount >= maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Gửi một message đến Kafka Topic
 * @param {Object} prod - Kafka Producer Instance
 * @param {string} topic - Tên Kafka Topic
 * @param {string} eventType - Loại event (VD: ORDER_CREATED)
 * @param {Object} payload - Nội dung data của event
 * @param {string} [key] - Message key (dùng để định tuyến partition nếu cần)
 */
async function publishMessage(prod, topic, eventType, payload, key = null) {
  const activeProducer = prod || producer;
  if (!activeProducer) {
    throw new Error(
      "Kafka Producer is not connected. Call connectProducer() first.",
    );
  }

  const messageValue = JSON.stringify({
    eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  try {
    const recordMetadata = await activeProducer.send({
      topic,
      messages: [
        {
          key: key ? String(key) : null,
          value: messageValue,
          headers: {
            eventType: eventType,
          },
        },
      ],
    });
    logger.info(
      `📤 Published [${eventType}] to topic [${topic}]. Partition: ${recordMetadata[0].partition}`,
    );
    return recordMetadata;
  } catch (error) {
    logger.error(
      `❌ Failed to publish message [${eventType}] to [${topic}]:`,
      error,
    );
    throw error;
  }
}

/**
 * Khởi tạo và chạy một Kafka Consumer
 * @param {string} groupId - Consumer Group ID
 * @param {string} topic - Topic cần subscribe
 * @param {Function} messageHandler - Hàm callback xử lý message: async (eventType, data, message) => {}
 */
async function startConsumer(groupId, topic, messageHandler) {
  // autoCommit: false to manually manage offsets (similar to XACK)
  const consumer = kafka.consumer({ groupId, autoCommit: false });

  try {
    logger.info(`Connecting Kafka Consumer for group [${groupId}]...`);
    await consumer.connect();
    logger.info(`✅ Kafka Consumer [${groupId}] connected.`);

    logger.info(`Subscribing to topic [${topic}]...`);
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      autoCommit: false, // Turn off automatic commits
      eachMessage: async ({ topic: msgTopic, partition, message }) => {
        const rawValue = message.value.toString();
        let parsedMessage = {};
        try {
          parsedMessage = JSON.parse(rawValue);
        } catch (e) {
          parsedMessage = { raw: rawValue };
        }

        const eventType = parsedMessage.eventType || "UNKNOWN";
        const data = parsedMessage.data || parsedMessage;

        logger.info(`📥 Received [${eventType}] from [${msgTopic}] partition [${partition}]`);

        // 1. Retry Mechanism
        const maxMsgRetries = 3;
        let attempt = 0;
        let success = false;
        let lastError = null;

        while (attempt < maxMsgRetries && !success) {
          try {
            if (attempt > 0) {
              const delay = attempt * 2000; // Backoff strategy
              logger.info(`🔄 Retrying message [${eventType}] (Attempt ${attempt + 1}/${maxMsgRetries}) in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            await messageHandler(eventType, data, message);
            success = true;
          } catch (err) {
            attempt++;
            lastError = err;
            logger.warn(`⚠️ Error processing message [${eventType}] (Attempt ${attempt}/${maxMsgRetries}): ${err.message}`);
          }
        }

        // 2. Dead Letter Queue (DLQ)
        if (!success) {
          logger.error(`❌ Message processing completely FAILED after ${maxMsgRetries} attempts in group [${groupId}].`);
          
          const dlqTopic = `${msgTopic}:dlq`; // Format: ":dlq" suffix
          try {
            logger.info(`📤 Sending failed message [${eventType}] to DLQ topic [${dlqTopic}]...`);
            const dlqPayload = {
              originalTopic: msgTopic,
              originalGroup: groupId,
              error: {
                message: lastError.message,
                stack: lastError.stack,
              },
              messageValue: rawValue,
            };
            
            const activeProducer = producer || await connectProducer();
            await publishMessage(activeProducer, dlqTopic, `${eventType}_FAILED`, dlqPayload, message.key);
            logger.info(`✅ Successfully forwarded failed message to DLQ [${dlqTopic}].`);
          } catch (dlqErr) {
            logger.error(`🚨 CRITICAL FAILED to send message to DLQ: ${dlqErr.message}`);
          }
        }

        // 3. Manual Commit Offset (XACK equivalent)
        try {
          const offsetToCommit = (BigInt(message.offset) + 1n).toString();
          await consumer.commitOffsets([
            { topic: msgTopic, partition, offset: offsetToCommit }
          ]);
          logger.info(`💾 Committed offset [${offsetToCommit}] for partition [${partition}]`);
        } catch (commitErr) {
          logger.error(`🚨 Failed to commit offset: ${commitErr.message}`);
        }
      },
    });

    return consumer;
  } catch (error) {
    logger.error(`❌ Failed to start Kafka Consumer for group [${groupId}]:`, error);
    throw error;
  }
}

module.exports = {
  kafka,
  connectProducer,
  publishMessage,
  startConsumer,
};
