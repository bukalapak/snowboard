package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"reflect"
	"strconv"
	"strings"
)

func ParseJSON(r io.Reader) (*Element, error) {
	var el Element

	err := json.NewDecoder(r).Decode(&el.object)
	if err != nil {
		return nil, err
	}

	return &el, nil
}

func NewAPI(el *Element) (*API, error) {
	if el.Path("element").String() != "parseResult" {
		return nil, errors.New("Unsupported element")
	}

	children, err := el.Path("content").Children()
	if err != nil {
		return nil, err
	}

	a := &API{}

	for _, child := range children {
		a.digElements(child)
	}

	return a, nil
}

func (a *API) digElements(el *Element) {
	switch el.Path("element").String() {
	case "category":
		if hasClass("api", el) {
			a.digTitle(el)
			a.digDescription(el)
			a.digMetadata(el)
			a.digResourceGroups(el)
			a.digHelperAttributes()
		}
	case "annotation":
		a.digAnnotation(el)
	}
}

func (a *API) digAnnotation(el *Element) {
	if el.Path("element").String() == "annotation" {
		n := &Annotation{
			Description: el.Path("content").String(),
			Classes:     extractSliceString("meta.classes", el),
			Code:        extractInt("attributes.code", el),
		}

		n.digSourceMaps(el.Path("attributes.sourceMap"))
		a.Annotations = append(a.Annotations, *n)
	}
}

func (n *Annotation) digSourceMaps(el *Element) {
	children, err := el.Children()
	if err != nil {
		return
	}

	for _, child := range children {
		cx := child.Path("content").Value()

		if cx.IsValid() && cx.Kind() == reflect.Slice {
			for i := 0; i < cx.Len(); i++ {
				ns := [2]int{}

				for j, n := range cx.Index(i).Interface().([]interface{}) {
					ns[j] = int(n.(float64))
				}

				m := SourceMap{Row: ns[0], Col: ns[1]}
				n.SourceMaps = append(n.SourceMaps, m)
			}
		}
	}
}

func (a *API) digTitle(el *Element) {
	if hasClass("api", el) {
		a.Title = el.Path("meta.title").String()
	}
}

func (a *API) digDescription(el *Element) {
	a.Description = extractCopy(el)
}

func (a *API) digMetadata(el *Element) {
	children, err := el.Path("attributes.meta").Children()
	if err != nil {
		return
	}

	for _, v := range children {
		m := Metadata{
			Key:   v.Path("content.key.content").String(),
			Value: v.Path("content.value.content").String(),
		}

		a.Metadata = append(a.Metadata, m)
	}
}

func (a *API) digResourceGroups(el *Element) {
	children := filterContentByClass("resourceGroup", el)

	for _, child := range children {
		g := &ResourceGroup{
			Title:       child.Path("meta.title").String(),
			Description: extractCopy(child),
		}

		g.digResources(child)
		a.ResourceGroups = append(a.ResourceGroups, *g)
	}
}

func (a *API) Host() string {
	for _, m := range a.Metadata {
		if m.Key == "HOST" {
			return m.Value
		}
	}

	return ""
}

func (a *API) digHelperAttributes() {
	for _, g := range a.ResourceGroups {
		for _, r := range g.Resources {
			for _, t := range r.Transitions {
				t.Method = requestMethod(*t)
				t.Permalink = buildPermalink(g, r, t, t.Method)
				t.URL = buildURL(a.Host(), t, r)
			}
		}
	}
}

func (g *ResourceGroup) digResources(el *Element) {
	children := filterContentByElement("resource", el)

	cr := make(chan *Resource)
	oc := make([]string, len(children))
	rs := make([]*Resource, len(children))

	for i, child := range children {
		oc[i] = child.Path("meta.title").String()

		go func(c *Element) {
			r := &Resource{
				Title:       c.Path("meta.title").String(),
				Description: extractCopy(c),
				Href:        extractHrefs(c),
			}

			r.digTransitions(c)

			cr <- r
		}(child)
	}

	for i := 0; i < len(children); i++ {
		r := <-cr

		for n := range oc {
			if oc[n] == r.Title {
				rs[n] = r
			}
		}
	}

	g.Resources = rs
}

func (r *Resource) digTransitions(el *Element) {
	children := filterContentByElement("transition", el)

	for _, child := range children {
		t := &Transition{
			Title:       child.Path("meta.title").String(),
			Description: extractCopy(child),
			Href:        extractHrefs(child),
		}

		t.digTransactions(child)
		r.Transitions = append(r.Transitions, t)
	}
}

func (t *Transition) digTransactions(el *Element) {
	children := filterContentByElement("httpTransaction", el)

	for _, child := range children {
		cx, err := child.Path("content").Children()
		if err != nil {
			continue
		}

		t.Transactions = append(t.Transactions, t.digTransaction(cx))
	}
}

func (t *Transition) digTransaction(el []*Element) Transaction {
	x := &Transaction{}

	for _, child := range el {
		if child.Path("element").String() == "httpRequest" {
			x.digRequest(child)
		}

		if child.Path("element").String() == "httpResponse" {
			x.digResponse(child)
		}
	}

	return *x
}

func (x *Transaction) digRequest(child *Element) {
	x.Request.Title = child.Path("meta.title").String()
	x.Request.Description = extractCopy(child)
	x.Request.Method = child.Path("attributes.method").String()
	x.Request.Headers = extractHeaders(child.Path("attributes.headers"))

	cx, err := child.Path("content").Children()
	if err != nil {
		return
	}

	for _, c := range cx {
		if hasClass("messageBody", c) {
			x.Request.Body = extractAsset(c)
		}

		if hasClass("messageBodySchema", c) {
			x.Request.Schema = extractAsset(c)
		}
	}
}

func (x *Transaction) digResponse(child *Element) {
	x.Response.StatusCode = extractInt("attributes.statusCode", child)
	x.Response.Headers = extractHeaders(child.Path("attributes.headers"))
	x.Response.Description = extractCopy(child)

	cx, err := child.Path("content").Children()
	if err != nil {
		return
	}

	for _, c := range cx {
		if hasClass("messageBody", c) {
			x.Response.Body = extractAsset(c)
		}

		if hasClass("messageBodySchema", c) {
			x.Response.Schema = extractAsset(c)
		}
	}
}

func extractHeaders(child *Element) (hs []Header) {
	if child.Path("element").String() == "httpHeaders" {
		contents, err := child.Path("content").Children()
		if err != nil {
			return
		}

		for _, content := range contents {
			h := Header{
				Key:   content.Path("content.key.content").String(),
				Value: content.Path("content.value.content").String(),
			}

			hs = append(hs, h)
		}

		return
	}

	return
}

func extractHrefs(child *Element) (h Href) {
	href := child.Path("attributes.href")

	if href.Value().IsValid() {
		h.Path = href.String()
	}

	contents, err := child.Path("attributes.hrefVariables.content").Children()
	if err != nil {
		return
	}

	for _, content := range contents {
		kind := content.Path("meta.title").String()
		value := content.Path("content.value.content").String()
		members := []string{}

		if content.Path("content.value.element").String() == "enum" {
			// Enum values are stored in a different location.
			// As `attributes.samples` is an array of arrays
			// and Parameter does not support multiple values,
			// flattening the array and selecting the first elem works fine.
			samples, err := content.Path("content.value.attributes.samples").FlatChildren()
			if err == nil && len(samples) > 0 {
				value = samples[0].Path("content").String()
			}

			values, err := content.Path("content.value.content").FlatChildren()
			if err == nil && len(values) > 0 {
				for i := range values {
					members = append(members, values[i].Path("content").String())
				}
			}

			kind = fmt.Sprintf("enum[%s]", kind)
		}

		v := &Parameter{
			Required:    isContains("attributes.typeAttributes", "required", content),
			Key:         content.Path("content.key.content").String(),
			Value:       value,
			Kind:        kind,
			Description: content.Path("meta.description").String(),
			Default:     content.Path("content.value.attributes.default").String(),
			Members:     members,
		}

		h.Parameters = append(h.Parameters, *v)
	}

	return
}

func extractAsset(child *Element) (a Asset) {
	if child.Path("element").String() == "asset" {
		return Asset{
			ContentType: child.Path("attributes.contentType").String(),
			Body:        strUnescapse(child.Path("content").String()),
		}
	}

	return
}

func hasClass(s string, child *Element) bool {
	return isContains("meta.classes", s, child)
}

func isContains(key, s string, child *Element) bool {
	v := child.Path(key).Value()

	if !v.IsValid() {
		return false
	}

	for i := 0; i < v.Len(); i++ {
		if s == v.Index(i).Interface().(string) {
			return true
		}
	}

	return false
}

func extractCopy(el *Element) string {
	children, err := el.Path("content").Children()
	if err != nil {
		return ""
	}

	for _, child := range children {
		if child.Path("element").String() == "copy" {
			return child.Path("content").String()
		}
	}

	return ""
}

func extractSliceString(key string, child *Element) []string {
	x := []string{}
	v := child.Path(key).Value()

	if !v.IsValid() {
		return x
	}

	for i := 0; i < v.Len(); i++ {
		x = append(x, v.Index(i).Interface().(string))
	}

	return x
}

func extractInt(key string, child *Element) int {
	var err error

	s := child.Path(key).String()
	n, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}

	return n
}

func filterContentByElement(s string, el *Element) (xs []*Element) {
	children, err := el.Path("content").Children()
	if err != nil {
		return
	}

	for _, child := range children {
		if child.Path("element").String() == s {
			xs = append(xs, child)
		}
	}

	return
}

func filterContentByClass(s string, el *Element) (xs []*Element) {
	children, err := el.Path("content").Children()
	if err != nil {
		return
	}

	for _, child := range children {
		if hasClass(s, child) {
			xs = append(xs, child)
		}
	}

	return
}

func strUnescapse(s string) string {
	ms := map[string]string{
		`\\n`: `\n`,
		`\\r`: `\r`,
		`\\"`: `\"`,
	}

	for key, val := range ms {
		s = strings.Replace(s, key, val, -1)
	}

	return s
}

func parameterize(s string) string {
	return strings.Replace(strings.ToLower(s), " ", "-", -1)
}

func requestMethod(t Transition) string {
	for _, x := range t.Transactions {
		if x.Request.Method != "" {
			return x.Request.Method
		}
	}

	return ""
}

func buildPermalink(g ResourceGroup, r *Resource, t *Transition, fallback string) string {
	xs := []string{}

	if g.Title != "" {
		xs = append(xs, parameterize(g.Title))
	}

	if r.Title != "" {
		xs = append(xs, parameterize(r.Title))
	} else {
		xs = append(xs, parameterize(r.Href.Path))
	}

	if t.Title != "" {
		xs = append(xs, parameterize(t.Title))
	} else {
		xs = append(xs, parameterize(fallback))
	}

	return strings.Join(xs, "-")

}

func buildURL(host string, t *Transition, r *Resource) string {
	var path string

	if t.Href.Path != "" {
		path = t.Href.Path
	} else {
		path = r.Href.Path
	}

	h := strings.TrimSuffix(host, "/")
	s := fmt.Sprintf("%s%s", h, path)

	return s
}
