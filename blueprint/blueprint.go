package blueprint

import "net/http"

type API struct {
	Title          string
	Description    string
	Metadata       []Metadata
	DataStructures []DataStructure
	ResourceGroups []ResourceGroup
}

type DataStructure struct {
	Required bool
	Key      string
	Value    string
	Kind     string
}

type Metadata struct {
	Key   string
	Value string
}

type ResourceGroup struct {
	Title     string
	Resources []Resource
}

type Resource struct {
	Title         string
	Transitions   []Transition
	DataStructure DataStructure
	Href          Href
}

type Transition struct {
	Title        string
	Description  string
	Transactions []Transaction
}

type Asset struct {
	ContentType string
	Body        string
}

type Request struct {
	Method      string
	Body        Asset
	Schema      Asset
	Headers     http.Header
	ContentType string
}

type Response struct {
	StatusCode    int
	Headers       http.Header
	Body          Asset
	Schema        Asset
	DataStructure DataStructure
}

type Transaction struct {
	Request  Request
	Response Response
}

type Href struct {
	Path      string
	Variables []HVariable
}

type HVariable struct {
	Description string
	Key         string
	Value       string
}
