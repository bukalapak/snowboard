package snowboard_test

import (
	"bytes"
	"io/ioutil"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/subosito/snowboard"
)

func TestParse(t *testing.T) {
	f, err := ioutil.ReadFile("fixtures/api-blueprint/examples/01. Simplest API.md")
	assert.Nil(t, err)

	api, err := snowboard.Parse(bytes.NewReader(f))
	assert.Nil(t, err)
	assert.Equal(t, "The Simplest API", api.Title)
}
