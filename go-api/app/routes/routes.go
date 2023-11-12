package routes

import (
	"trivia-game-api/app/handler"

	"github.com/gofiber/fiber/v2"
)

// SetupRoutes defines all the routes for the application
func SetupRoutes(app *fiber.App) {
	// Hello World route
	app.Get("/", handler.HelloHandler)
}
