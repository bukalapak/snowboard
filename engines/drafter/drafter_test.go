package drafter_test

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/subosito/snowboard/engines/drafter"
)

func TestEngine_Parse(t *testing.T) {
	c := drafter.Engine{}
	s := strings.NewReader("# API")

	b, err := c.Parse(s)
	assert.Nil(t, err)
	assert.Contains(t, string(b), "API")
}
