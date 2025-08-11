package safety

import (
	"os"
	"path/filepath"
	"time"

	"github.com/bwmarrin/discordgo"
	"github.com/sirupsen/logrus"
)

var logger *logrus.Logger

func init() {
	logger = logrus.New()
	logger.Out = os.Stdout
	lvl, err := logrus.ParseLevel(os.Getenv("LOG_LEVEL"))
	if err != nil {
		lvl = logrus.InfoLevel
	}
	logger.SetLevel(lvl)
	logger.SetFormatter(&logrus.TextFormatter{FullTimestamp: true})
}

func ensureDir(p string) {
	_ = os.MkdirAll(p, 0755)
}

func appendLog(file, line string) {
	ensureDir(filepath.Dir(file))
	f, err := os.OpenFile(file, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return
	}
	defer f.Close()
	_, _ = f.WriteString(line + "\n")
}

func nowIso() string { return time.Now().UTC().Format(time.RFC3339) }

func UserAgeDays(u *discordgo.User) int {
	t, err := discordgo.SnowflakeTimestamp(u.ID)
	if err != nil {
		return 0
	}
	return int(time.Since(t).Hours() / 24)
}

func Getenv(key, fallback string) string {
	return os.Getenv(key)
}
