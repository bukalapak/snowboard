package drafter_test

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/subosito/snowboard/drafter"
)

func TestEngine_Parse(t *testing.T) {
	c := drafter.Engine{}
	s := strings.NewReader("# API")

	b, err := c.Parse(s)
	assert.Nil(t, err)
	assert.Contains(t, string(b), "API")
}

func TestEngine_Validate(t *testing.T) {
	c := drafter.Engine{}
	s := strings.NewReader("# API\n## Data Structures\n### Hello-World (object)\n+ foo: bar (string, required)")

	b, err := c.Validate(s)
	assert.Nil(t, err)
	assert.Contains(t, string(b), "please escape the name of the data structure using backticks")
}
