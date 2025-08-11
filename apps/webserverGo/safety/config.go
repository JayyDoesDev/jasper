package safety

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/sirupsen/logrus"
)

var Logger = logrus.New()

func init() {
	// Set log level
	logLevel := os.Getenv("LOG_LEVEL")
	if logLevel == "" {
		logLevel = "info"
	}
	level, err := logrus.ParseLevel(logLevel)
	if err != nil {
		logrus.Fatalf("Invalid log level: %v", err)
	}
	Logger.SetLevel(level)

	// Set log format
	Logger.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})

	// Set log output
	logDir := os.Getenv("LOG_DIR")
	if logDir == "" {
		logDir = "./logs"
	}
	if err := os.MkdirAll(logDir, 0755); err != nil {
		logrus.Fatalf("Failed to create log directory: %v", err)
	}
	logFile := filepath.Join(logDir, "safety.log")
	f, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		logrus.Fatalf("Failed to open log file: %v", err)
	}
	mw := io.MultiWriter(os.Stdout, f)
	Logger.SetOutput(mw)
}

type ProviderName string

const (
	ProviderOpenAI   ProviderName = "openai"
	ProviderAnthropic ProviderName = "anthropic"
	ProviderMistral  ProviderName = "mistral"
	ProviderGroq     ProviderName = "groq"
	ProviderXAI      ProviderName = "xai"
	ProviderHF       ProviderName = "huggingface"
)

type BotConfig struct {
	Provider        ProviderName `json:"provider"`
	Model           string       `json:"model"`
	ProductionReady bool         `json:"productionReady"`
	TriggerPatterns []string     `json:"triggerPatterns"`
	HardBlockRegexes []string    `json:"hardBlockRegexes"`
	RateLimit struct {
		MaxCallsPerMinute     int `json:"maxCallsPerMinute"`
		PerChannelCooldownSec int `json:"perChannelCooldownSec"`
	} `json:"rateLimit"`
	Moderation struct {
		MinConfidenceToDelete float64 `json:"minConfidenceToDelete"`
		MinConfidenceToFlag   float64 `json:"minConfidenceToFlag"`
		DeleteIfHardBlockRegex bool   `json:"deleteIfHardBlockRegex"`
		Actions struct {
			DeleteMessage  bool `json:"deleteMessage"`
			DmUserOnDelete bool `json:"dmUserOnDelete"`
			PostModAlert   bool `json:"postModAlert"`
		} `json:"actions"`
	} `json:"moderation"`
	FewShot struct {
		MaxSeedExamples      int  `json:"maxSeedExamples"`
		MaxLearnedExamples   int  `json:"maxLearnedExamples"`
		MaxExamplesPerPrompt int  `json:"maxExamplesPerPrompt"`
		PrioritizeHardNegatives bool `json:"prioritizeHardNegatives"`
	} `json:"fewShot"`
	Logging struct {
		Level string `json:"level"`
	} `json:"logging"`
}

func LoadConfig() (*BotConfig, error) {
	configPath := os.Getenv("SAFETY_CONFIG_PATH")
	if configPath == "" {
		configPath = "safety/config.json"
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("read config.json: %w", err)
	}
	var cfg BotConfig
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("parse config: %w", err)
	}
	if p := os.Getenv("LLM_PROVIDER"); p != "" {
		cfg.Provider = ProviderName(p)
	}
	return &cfg, nil
}
