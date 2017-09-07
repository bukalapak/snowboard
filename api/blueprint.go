package api

type API struct {
	Title          string
	Description    string
	Metadata       []Metadata
	ResourceGroups []ResourceGroup
	Annotations    []Annotation
}

type Metadata struct {
	Key   string
	Value string
}

type ResourceGroup struct {
	Title       string
	Description string
	Resources   []*Resource
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
	Default     string
	Members     []string
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
