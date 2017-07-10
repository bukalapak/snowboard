package drafter_test

import (
	"strings"
	"testing"

	"github.com/bukalapak/snowboard/adapter/drafter"
	"github.com/stretchr/testify/assert"
)

func TestDrafter_Parse(t *testing.T) {
	c := drafter.Engine{}
	s := strings.NewReader("# API")

	b, err := c.Parse(s)
	assert.Nil(t, err)
	assert.Contains(t, string(b), "API")
}

func TestDrafter_Validate(t *testing.T) {
	c := drafter.Engine{}

	s := strings.NewReader("# API")
	b, err := c.Validate(s)
	assert.Nil(t, err)
	assert.Empty(t, string(b))

	s = strings.NewReader("# API\n## Data Structures\n### Hello-World (object)\n+ foo: bar (string, required)")
	b, err = c.Validate(s)
	assert.Nil(t, err)
	assert.Contains(t, string(b), "please escape the name of the data structure using backticks")
}

func TestDrafter_Version(t *testing.T) {
	c := drafter.Engine{}
	v := c.Version()
	assert.Equal(t, drafter.Version, v)
}
