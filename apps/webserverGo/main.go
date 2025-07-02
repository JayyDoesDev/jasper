package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"

	"jasper/middleware"
	routes_fun "jasper/routes/fun"
	routes_yt "jasper/routes/youtube"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or failed to load")
	}

	r := mux.NewRouter()
	r.Use(middleware.AuthMiddleware)
    r.Use(middleware.LoggingMiddleware)

	r.HandleFunc("/youtube/{id}", routes_yt.ChannelInfoHandler).Methods("GET")
	r.HandleFunc("/youtube/{id}/subscribers", routes_yt.SubscriberCountHandler).Methods("GET")

	r.HandleFunc("/fun/caption", routes_fun.CaptionHandler).Methods("POST")
	r.HandleFunc("/fun/meme", routes_fun.MemeHandler).Methods("POST")
	r.HandleFunc("/fun/speechbubble", routes_fun.BubbleHandler).Methods("POST")
	r.HandleFunc("/fun/skullboard", routes_fun.SkullboardHandler).Methods("POST")

	fmt.Println("Server is running on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
