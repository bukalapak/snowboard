package api

type API struct {
	Title          string
	Description    string
	Metadata       []Metadata
	ResourceGroups []ResourceGroup
	DataStructures DataStructures
	Annotations    []Annotation
}

type DataStructures map[string]DataStructure

type Metadata struct {
	Key   string
	Value string
}

type ResourceGroup struct {
	Title       string
	Description string
	Resources   []*Resource
}

type DataStructure struct {
	Name       string
	Parameters []Parameter
}

type Resource struct {
	Title       string
	Description string
	Transitions []*Transition
	Href        Href
}

type Transition struct {
	Title        string
	Description  string
	Href         Href
	Transactions []Transaction
	Attributes   []Attribute

	Permalink string
	Method    string
	URL       string
}

type Asset struct {
	ContentType string
	Body        string
}

type Header struct {
	Key   string
	Value string
}

type Request struct {
	Title       string
	Description string
	Method      string
	Body        Asset
	Schema      Asset
	Headers     []Header
	ContentType string
}

type Response struct {
	StatusCode  int
	Description string
	Headers     []Header
	Body        Asset
	Schema      Asset
}

type Transaction struct {
	Request  Request
	Response Response
}

type Href struct {
	Path       string
	Parameters []Parameter
}

type Parameter struct {
	Required    bool
	Description string
	Key         string
	Value       string
	Kind        string
}

type Attribute struct {
	Kind       string
	Parameters []Parameter
}

type Annotation struct {
	Description string
	Classes     []string
	Code        int
	SourceMaps  []SourceMap
}

type SourceMap struct {
	Row int
	Col int
}
