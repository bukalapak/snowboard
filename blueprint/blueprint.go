package blueprint

type API struct {
	Title          string
	Description    string
	Metadata       []Metadata
	DataStructures []DataStructure
	ResourceGroups []ResourceGroup
}

type DataStructure struct {
	Name       string
	ID         string
	Structures []Structure
}

type Structure struct {
	Required    bool
	Description string
	Key         string
	Value       string
	Kind        string
}

type Metadata struct {
	Key   string
	Value string
}

type ResourceGroup struct {
	Title       string
	Description string
	Resources   []Resource
}

type Resource struct {
	Title          string
	Description    string
	Transitions    []Transition
	DataStructures []DataStructure
	Href           Href
}

type Transition struct {
	Title        string
	Description  string
	Href         Href
	Transactions []Transaction
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
	Method      string
	Body        Asset
	Schema      Asset
	Headers     []Header
	ContentType string
}

type Response struct {
	StatusCode     int
	Headers        []Header
	Body           Asset
	Schema         Asset
	DataStructures []DataStructure
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
