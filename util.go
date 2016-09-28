package snowboard

import (
	"net/http"
	"reflect"
	"strconv"

	"github.com/subosito/snowboard/blueprint"
)

func digString(key string, el *Element) string {
	v := el.Path(key).Value()

	if v.IsValid() && v.Kind() == reflect.String {
		return v.String()
	}

	return ""
}

func digTitle(el *Element) string {
	return digString("meta.title", el)
}

func digDescription(el *Element) string {
	children, err := el.Path("content").Children()
	if err != nil {
		return ""
	}

	for _, child := range children {
		if digString("element", child) == "copy" {
			return digString("content", child)
		}
	}

	return ""
}

func digMetadata(el *Element) []blueprint.Metadata {
	mds := []blueprint.Metadata{}

	children, err := el.Path("attributes.meta").Children()
	if err != nil {
		return mds
	}

	for _, v := range children {
		md := blueprint.Metadata{
			Name:  digString("content.key.content", v),
			Value: digString("content.value.content", v),
		}

		mds = append(mds, md)
	}

	return mds
}

func digResourceGroups(el *Element) (gs []blueprint.ResourceGroup) {
	children, err := el.Path("content").Children()
	if err != nil {
		return
	}

	for _, child := range children {
		if hasClass("resourceGroup", child) {
			g := &blueprint.ResourceGroup{
				Title:     digString("meta.title", child),
				Resources: digResources(child),
			}

			gs = append(gs, *g)
		}
	}

	return
}

func digResources(el *Element) (rs []blueprint.Resource) {
	children, err := el.Path("content").Children()
	if err != nil {
		return
	}

	for _, child := range children {
		if digString("element", child) == "resource" {
			r := &blueprint.Resource{
				Title:       digString("meta.title", child),
				Transitions: digTransitions(child),
				Href:        extractHrefs(child),
			}

			rs = append(rs, *r)
		}
	}

	return
}

func digTransitions(el *Element) (ts []blueprint.Transition) {
	children, err := el.Path("content").Children()
	if err != nil {
		return
	}

	for _, child := range children {
		if digString("element", child) == "transition" {
			t := &blueprint.Transition{
				Title:        digString("meta.title", child),
				Description:  digDescription(child),
				Transactions: digTransactions(child),
			}

			ts = append(ts, *t)
		}
	}

	return
}

func digTransactions(el *Element) (xs []blueprint.Transaction) {
	children, err := el.Path("content").Children()
	if err != nil {
		return
	}

	for _, child := range children {
		if digString("element", child) == "httpTransaction" {
			cx, err := child.Path("content").Children()
			if err != nil {
				continue
			}

			x := extractTransaction(cx)
			xs = append(xs, x)
		}
	}

	return
}

func extractTransaction(children []*Element) (x blueprint.Transaction) {
	for _, child := range children {
		if digString("element", child) == "httpRequest" {
			x.Request = extractRequest(child)
		}

		if digString("element", child) == "httpResponse" {
			x.Response = extractResponse(child)
		}
	}

	return
}

func extractRequest(child *Element) (r blueprint.Request) {
	r = blueprint.Request{
		Method:  digString("attributes.method", child),
		Headers: extractHeaders(child.Path("attributes.headers")),
	}

	cx, err := child.Path("content").Children()
	if err != nil {
		return
	}

	for _, c := range cx {
		if hasClass("messageBody", c) {
			r.Body = extractAsset(c)
		}

		if hasClass("messageBodySchema", c) {
			r.Schema = extractAsset(c)
		}
	}

	return
}

func extractResponse(child *Element) (r blueprint.Response) {
	r = blueprint.Response{
		StatusCode: extractStatusCode(child),
		Headers:    extractHeaders(child.Path("attributes.headers")),
	}

	cx, err := child.Path("content").Children()
	if err != nil {
		return
	}

	for _, c := range cx {
		if hasClass("messageBody", c) {
			r.Body = extractAsset(c)
		}

		if hasClass("messageBodySchema", c) {
			r.Schema = extractAsset(c)
		}
	}

	return
}

func extractHeaders(child *Element) (h http.Header) {
	h = http.Header{}

	if digString("element", child) == "httpHeaders" {
		contents, err := child.Path("content").Children()
		if err != nil {
			return
		}

		for _, content := range contents {
			key := digString("content.key.content", content)
			val := digString("content.value.content", content)

			h.Set(key, val)
		}

		return
	}

	return
}

func extractHrefs(child *Element) (h blueprint.Href) {
	if child.Path("href").Value().IsValid() {
		h.Path = digString("href", child)
	}

	contents, err := child.Path("attributes.hrefVariables.content").Children()
	if err != nil {
		return
	}

	for _, content := range contents {
		v := &blueprint.HVariable{
			Name:        digString("content.key.content", content),
			Value:       digString("content.value.content", content),
			Description: digString("meta.description", content),
		}

		h.Variables = append(h.Variables, *v)
	}

	return
}

func extractStatusCode(child *Element) int {
	var err error

	s := digString("attributes.statusCode", child)
	n, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}

	return n
}

func extractAsset(child *Element) (a blueprint.Asset) {
	if digString("element", child) == "asset" {
		return blueprint.Asset{
			ContentType: digString("attributes.contentType", child),
			Body:        digString("content", child),
		}
	}

	return
}

func extractBody(child *Element) (a blueprint.Asset) {
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
