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
  try {
    logger.info("Connecting Kafka Producer...");
    await producer.connect();
    logger.info("✅ Kafka Producer connected successfully.");
    return producer;
  } catch (error) {
    logger.error("❌ Failed to connect Kafka Producer:", error);
    throw error;
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
  const consumer = kafka.consumer({ groupId });

  try {
    logger.info(`Connecting Kafka Consumer for group [${groupId}]...`);
    await consumer.connect();
    logger.info(`✅ Kafka Consumer [${groupId}] connected.`);

    logger.info(`Subscribing to topic [${topic}]...`);
    await consumer.subscribe({ topic, fromBeginning: true });

    await consumer.run({
      eachMessage: async ({ topic: msgTopic, partition, message }) => {
        try {
          const rawValue = message.value.toString();
          const parsedMessage = JSON.parse(rawValue);

          const eventType =
            parsedMessage.eventType ||
            (message.headers && message.headers.eventType
              ? message.headers.eventType.toString()
              : "UNKNOWN");
          const data = parsedMessage.data || parsedMessage;

          logger.info(
            `📥 Received [${eventType}] from [${msgTopic}] partition [${partition}]`,
          );

          // Gọi hàm xử lý business logic
          await messageHandler(eventType, data, message);
        } catch (err) {
          logger.error(
            `❌ Error processing message in group [${groupId}] on partition [${partition}]:`,
            err,
          );
          // Có thể triển khai DLQ (Dead Letter Queue) hoặc cơ chế retry nâng cao ở đây
        }
      },
    });

    return consumer;
  } catch (error) {
    logger.error(
      `❌ Failed to start Kafka Consumer for group [${groupId}]:`,
      error,
    );
    throw error;
  }
}

module.exports = {
  kafka,
  connectProducer,
  publishMessage,
  startConsumer,
};
