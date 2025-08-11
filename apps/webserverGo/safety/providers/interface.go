package providers

type Response struct {
	JSON  map[string]interface{}
	Raw   string
	Token int
}

type Client interface {
	Classify(model, system, user string) (Response, error)
}
