package snowboard_test

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/subosito/snowboard"
	"github.com/subosito/snowboard/engines/drafter"
	"github.com/subosito/snowboard/engines/drafterc"
)

func TestParse(t *testing.T) {
	testParse(t, drafter.Engine{})
}

func TestParse_customEngine(t *testing.T) {
	testParse(t, drafterc.Engine{})
}

func testParse(t *testing.T, parser snowboard.Parser) {
	s := strings.NewReader("# API")

	api, err := snowboard.Parse(s, parser)
	assert.Nil(t, err)
	assert.Equal(t, "API", api.Title)
}
