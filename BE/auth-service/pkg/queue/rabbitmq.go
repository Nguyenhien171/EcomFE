package queue

import (
	"github.com/streadway/amqp"
	"go.uber.org/zap"
)

type Publisher struct {
	ch  *amqp.Channel
	ex  string
	log *zap.Logger
}

func NewPublisher(url, exchange string, log *zap.Logger) *Publisher {
    conn, err := amqp.Dial(url)
    if err != nil {
        log.Fatal("Failed to connect to RabbitMQ", zap.Error(err))
    }
    ch, err := conn.Channel()
    if err != nil {
        log.Fatal("Failed to open RabbitMQ channel", zap.Error(err))
    }
    // Chỉ declare exchange nếu tên exchange khác chuỗi rỗng
    if exchange != "" {
        err = ch.ExchangeDeclare(
            exchange, "topic", true, false, false, false, nil,
        )
        if err != nil {
            log.Fatal("Failed to declare exchange", zap.Error(err))
        }
    }
    return &Publisher{ch: ch, ex: exchange, log: log}
}


func (p *Publisher) Publish(routingKey string, body []byte) error {
	return p.ch.Publish(p.ex, routingKey, false, false, amqp.Publishing{
		ContentType: "application/json",
		Body:        body,
	})
}

func (p *Publisher) Close() {
	p.ch.Close()
}