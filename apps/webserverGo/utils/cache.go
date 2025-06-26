package utils

import (
    "time"
    "sync"
)

type cachedResponse struct {
	data      map[string]interface{}
	timestamp time.Time
}

var (
	Cache     = make(map[string]cachedResponse)
	CacheLock sync.RWMutex
	CacheTTL  = time.Hour
)
