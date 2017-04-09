package drafterc_test

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/subosito/snowboard/adapter/drafter"
	"github.com/subosito/snowboard/adapter/drafterc"
)

func TestDrafter_Parse(t *testing.T) {
	c := drafterc.Engine{}
	s := strings.NewReader("# API")

	b, err := c.Parse(s)
	assert.Nil(t, err)
	assert.Contains(t, string(b), "API")
}

func TestEngine_Validate(t *testing.T) {
	c := drafterc.Engine{}

	s := strings.NewReader("# API")
	b, err := c.Validate(s)
	assert.Nil(t, err)
	assert.Empty(t, string(b))

	s = strings.NewReader("# API\n## Data Structures\n### Hello-World (object)\n+ foo: bar (string, required)")
	b, err = c.Validate(s)
	assert.Nil(t, err)
	assert.Equal(t, string(b), "warning: (3)  please escape the name of the data structure using backticks since it contains MSON reserved characters; line 3, column 1 - line 3, column 25")
}

func TestDrafter_Version(t *testing.T) {
	c := drafterc.Engine{}
	v := c.Version()
	assert.Equal(t, drafter.Version, v)
}
