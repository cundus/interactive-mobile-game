package handler

import (
	service "trivia-game-api/app/services"

	"github.com/gofiber/fiber/v2"
)

// HelloHandler handles the "Hello, World!" route
func HelloHandler(c *fiber.Ctx) error {
	message := service.GetHelloMessage()
	return c.SendString(message)
}
