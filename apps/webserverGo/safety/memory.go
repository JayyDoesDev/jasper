package safety

import (
	"bufio"
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

const (
	seedExamplesFile    = "examples/seed_examples.jsonl"
	learnedExamplesFile = "examples/learned_examples.jsonl"
)

type LabeledExampleJSON struct {
	Content string `json:"content"`
	Label   string `json:"label"`
	Reason  string `json:"reason,omitempty"`
	Meta struct {
		Channel       string `json:"channel,omitempty"`
		AuthorAgeDays int    `json:"authorAgeDays,omitempty"`
	} `json:"meta,omitempty"`
	Weight float64 `json:"weight,omitempty"`
}

func readJsonl(file string) ([]LabeledExampleJSON, error) {
	f, err := os.Open(file)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	defer f.Close()
	s := bufio.NewScanner(f)
	var out []LabeledExampleJSON
	for s.Scan() {
		line := strings.TrimSpace(s.Text())
		if line == "" {
			continue
		}
		var ex LabeledExampleJSON
		if err := json.Unmarshal([]byte(line), &ex); err == nil {
			out = append(out, ex)
		}
	}
	return out, s.Err()
}

func loadExamples(cfg *BotConfig) []LabeledExampleJSON {
	seed, _ := readJsonl(seedExamplesFile)
	learned, _ := readJsonl(learnedExamplesFile)
	if len(seed) > cfg.FewShot.MaxSeedExamples {
		seed = seed[len(seed)-cfg.FewShot.MaxSeedExamples:]
	}
	if len(learned) > cfg.FewShot.MaxLearnedExamples {
		learned = learned[len(learned)-cfg.FewShot.MaxLearnedExamples:]
	}
	if cfg.FewShot.PrioritizeHardNegatives {
		sort.Slice(learned, func(i, j int) bool {
			return learned[i].Weight > learned[j].Weight
		})
	}

	combined := append(seed, learned...)
	if len(combined) > cfg.FewShot.MaxExamplesPerPrompt {
		combined = combined[len(combined)-cfg.FewShot.MaxExamplesPerPrompt:]
	}
	return combined
}

func AdoptExample(input AdoptionInput) error {
	ensureDir(filepath.Dir(learnedExamplesFile))
	weight := 1.0
	if input.GroundTruth != "" && input.GroundTruth != input.Predicted {
		weight = 2.0
	} else if input.Confidence >= 0.85 {
		weight = 0.5
	}
	jsonLine, _ := json.Marshal(LabeledExampleJSON{
		Content: input.Content,
		Label:   chooseLabel(input),
		Reason:  input.Reason,
		Meta: struct{ Channel string "json:\"channel,omitempty\""; AuthorAgeDays int "json:\"authorAgeDays,omitempty\"" }{input.Meta.Channel, input.Meta.AuthorAgeDays},
		Weight:  weight,
	})
	f, err := os.OpenFile(learnedExamplesFile, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = f.Write(append(jsonLine, '\n'))
	return err
}

// AdoptionInput struct mirrors TS

type AdoptionInput struct {
	Content    string  `json:"content"`
	Predicted  string  `json:"predicted"`
	Confidence float64 `json:"confidence"`
	Meta       struct {
		Channel       string `json:"channel,omitempty"`
		AuthorAgeDays int    `json:"authorAgeDays,omitempty"`
	} `json:"meta"`
	GroundTruth string `json:"groundTruth,omitempty"`
	Reason      string `json:"reason,omitempty"`
}

func chooseLabel(a AdoptionInput) string {
	if a.GroundTruth != "" {
		return a.GroundTruth
	}
	return a.Predicted
}
