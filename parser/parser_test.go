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

func TestRead(t *testing.T) {
	b, err := snowboard.Read("../fixtures/extensions/html-comment.apib")
	assert.Nil(t, err)
	assert.Contains(t, string(b), `{class="ui table"}`)
	assert.Contains(t, string(b), `{id="awesome-table" class="ui small table"}`)
}

func TestRead_seed(t *testing.T) {
	b, err := snowboard.Read("../fixtures/seeds/API.apib")
	assert.Nil(t, err)
	assert.Contains(t, string(b), `200`)
	assert.Contains(t, string(b), `seeds usage`)
	assert.Contains(t, string(b), `user-related`)
}
