package utils

import (
	"sync"
	"time"
)

type cachedResponse struct {
	data      map[string]any
	timestamp time.Time
}

var (
	Cache     = make(map[string]cachedResponse)
	CacheLock sync.RWMutex
	CacheTTL  = time.Hour
)
