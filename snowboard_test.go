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

func TestLoad(t *testing.T) {
	engine := drafter.Engine{}
	api, err := snowboard.Load("engines/drafter/ext/drafter/features/fixtures/blueprint.apib", engine)
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
	api, err := snowboard.Load("fixtures/partials/API.apib", engine)
	assert.Nil(t, err)
	assert.Equal(t, "API", api.Title)
	assert.Equal(t, "Messages", api.ResourceGroups[0].Title)
	assert.Equal(t, "Users", api.ResourceGroups[1].Title)
	assert.Equal(t, "Tasks", api.ResourceGroups[2].Title)
}

func TestRead(t *testing.T) {
	b, err := snowboard.Read("fixtures/extensions/html-comment.apib")
	assert.Nil(t, err)
	assert.Contains(t, string(b), `{class="ui table"}`)
	assert.Contains(t, string(b), `{id="awesome-table" class="ui small table"}`)
}

func TestRead_seed(t *testing.T) {
	b, err := snowboard.Read("fixtures/seeds/API.apib")
	assert.Nil(t, err)
	assert.Contains(t, string(b), `200`)
	assert.Contains(t, string(b), `seeds usage`)
	assert.Contains(t, string(b), `user-related`)
}
