package drafterc_test

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/subosito/snowboard/engines/drafterc"
)

func TestEngine_Parse(t *testing.T) {
	c := drafterc.Engine{}
	s := strings.NewReader("# API")

	b, err := c.Parse(s)
	assert.Nil(t, err)
	assert.Contains(t, string(b), "API")
}
