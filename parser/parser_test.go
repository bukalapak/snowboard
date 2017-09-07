package parser_test

import (
	"strings"
	"testing"

	"github.com/bukalapak/snowboard/adapter/drafter"
	snowboard "github.com/bukalapak/snowboard/parser"
	"github.com/stretchr/testify/assert"
)

func TestParse(t *testing.T) {
	testParse(t, drafter.Engine{})
}

func TestParseAsJSON(t *testing.T) {
	testParseAsJSON(t, drafter.Engine{})
}

func testParse(t *testing.T, parser snowboard.Parser) {
	s := strings.NewReader("# API")

	api, err := snowboard.Parse(s, parser)
	assert.Nil(t, err)
	assert.Equal(t, "API", api.Title)
}

func testParseAsJSON(t *testing.T, parser snowboard.Parser) {
	s := strings.NewReader("# API")

	b, err := snowboard.ParseAsJSON(s, parser)
	assert.Nil(t, err)
	assert.Contains(t, string(b), `"title": "API"`)
}

func TestLoad(t *testing.T) {
	engine := drafter.Engine{}
	api, err := snowboard.Load("../adapter/drafter/ext/drafter/features/fixtures/blueprint.apib", engine)
	assert.Nil(t, err)
	assert.Equal(t, "<API name>", api.Title)
	assert.Equal(t, "<resource group name>", api.ResourceGroups[0].Title)
	assert.Equal(t, "<resource name>", api.ResourceGroups[0].Resources[0].Title)
	assert.Equal(t, "<action name>", api.ResourceGroups[0].Resources[0].Transitions[0].Title)
	assert.Equal(t, "<request name>", api.ResourceGroups[0].Resources[0].Transitions[0].Transactions[0].Request.Title)
	assert.Equal(t, "<request description>", api.ResourceGroups[0].Resources[0].Transitions[0].Transactions[0].Request.Description)
	assert.Equal(t, 200, api.ResourceGroups[0].Resources[0].Transitions[0].Transactions[0].Response.StatusCode)
	assert.Equal(t, "<response description>", api.ResourceGroups[0].Resources[0].Transitions[0].Transactions[0].Response.Description)

	api, err = snowboard.Load("../fixtures/api-blueprint/examples/10. Data Structures.md", engine)
	assert.Nil(t, err)
	assert.False(t, api.ResourceGroups[0].Resources[1].Transitions[0].Href.Parameters[0].Required)
	assert.Equal(t, "limit", api.ResourceGroups[0].Resources[1].Transitions[0].Href.Parameters[0].Key)
	assert.Equal(t, "number", api.ResourceGroups[0].Resources[1].Transitions[0].Href.Parameters[0].Kind)
	assert.Equal(t, "10", api.ResourceGroups[0].Resources[1].Transitions[0].Href.Parameters[0].Default)

	api, err = snowboard.Load("../fixtures/examples/enum.apib", engine)
	assert.Nil(t, err)
	assert.True(t, api.ResourceGroups[0].Resources[0].Transitions[0].Href.Parameters[0].Required)
	assert.Equal(t, "type", api.ResourceGroups[0].Resources[0].Transitions[0].Href.Parameters[0].Key)
	assert.Equal(t, "enum[string]", api.ResourceGroups[0].Resources[0].Transitions[0].Href.Parameters[0].Kind)
	assert.Equal(t, "foo", api.ResourceGroups[0].Resources[0].Transitions[0].Href.Parameters[0].Value)
	assert.Equal(t, []string{"foo", "bar", "baz"}, api.ResourceGroups[0].Resources[0].Transitions[0].Href.Parameters[0].Members)
}

func TestLoad_partials(t *testing.T) {
	engine := drafter.Engine{}
	api, err := snowboard.Load("../fixtures/partials/API.apib", engine)
	assert.Nil(t, err)
	assert.Equal(t, "API", api.Title)
	assert.Equal(t, "Messages", api.ResourceGroups[0].Title)
	assert.Equal(t, "Users", api.ResourceGroups[1].Title)
	assert.Equal(t, "Tasks", api.ResourceGroups[2].Title)
}

func TestLoadAsJSON(t *testing.T) {
	engine := drafter.Engine{}
	b, err := snowboard.LoadAsJSON("../adapter/drafter/ext/drafter/features/fixtures/blueprint.apib", engine)
	assert.Nil(t, err)
	assert.Contains(t, string(b), `"title": "<API name>"`)
}
