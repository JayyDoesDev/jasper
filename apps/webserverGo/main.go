package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
    "github.com/joho/godotenv"

    "jasper/middleware"
    routes_yt "jasper/routes/youtube"
    routes_fun "jasper/routes/fun"
)

func main() {
    err := godotenv.Load()
    if err != nil {
        log.Println("No .env file found or failed to load")
    }

	r := mux.NewRouter()
	r.Use(middleware.AuthMiddleware)

	r.HandleFunc("/youtube/{id}", routes_yt.ChannelInfoHandler).Methods("GET")
	r.HandleFunc("/youtube/{id}/subscribers", routes_yt.SubscriberCountHandler).Methods("GET")

    r.HandleFunc("/fun/meme", routes_fun.MemeHandler).Methods("POST")

	fmt.Println("Server is running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
