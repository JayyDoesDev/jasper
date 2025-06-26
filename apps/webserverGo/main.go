package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
    "github.com/joho/godotenv"

    "jasper/middleware"
    "jasper/routes/youtube"
)

// Handler for /youtube/{id}

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Println("No .env file found or failed to load")
    }

	r := mux.NewRouter()
	r.Use(middleware.AuthMiddleware)

	r.HandleFunc("/youtube/{id}", youtube.ChannelInfoHandler).Methods("GET")
	r.HandleFunc("/youtube/{id}/subscribers", youtube.SubscriberCountHandler).Methods("GET")

	fmt.Println("Server is running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
