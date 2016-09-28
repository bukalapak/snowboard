package snowboard

import (
	"net/http"
	"strconv"

	"github.com/subosito/snowboard/blueprint"
)

func digTitle(el *Element) string {
	if hasClass("api", el) {
		return el.Path("meta.title").String()
	}

	return ""
}

func digDescription(el *Element) string {
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

func digMetadata(el *Element) []blueprint.Metadata {
	mds := []blueprint.Metadata{}

	children, err := el.Path("attributes.meta").Children()
	if err != nil {
		return mds
	}

	for _, v := range children {
		md := blueprint.Metadata{
			Key:   v.Path("content.key.content").String(),
			Value: v.Path("content.value.content").String(),
		}

		mds = append(mds, md)
	}

	return mds
}

func digResourceGroups(el *Element) (gs []blueprint.ResourceGroup) {
	children := filterContentByClass("resourceGroup", el)

	for _, child := range children {
		g := &blueprint.ResourceGroup{
			Title:       child.Path("meta.title").String(),
			Description: digDescription(child),
			Resources:   digResources(child),
		}

		gs = append(gs, *g)
	}

	return
}

func digResources(el *Element) (rs []blueprint.Resource) {
	children := filterContentByElement("resource", el)

	cr := make(chan blueprint.Resource)

	for _, child := range children {
		go func(c *Element) {
			cr <- blueprint.Resource{
				Title:          c.Path("meta.title").String(),
				Description:    digDescription(c),
				Transitions:    digTransitions(c),
				Href:           extractHrefs(c),
				DataStructures: digDataStructures(c),
			}
		}(child)
	}

	for i := 0; i < len(children); i++ {
		rs = append(rs, <-cr)
	}

	return
}

func digDataStructures(el *Element) (ds []blueprint.DataStructure) {
	children := filterContentByElement("dataStructure", el)

	for _, child := range children {
		cx, err := child.Path("content").Children()
		if err != nil {
			continue
		}

		for _, c := range cx {
			d := blueprint.DataStructure{
				Name: c.Path("element").String(),
				ID:   c.Path("meta.id").String(),
			}

			cz, err := c.Path("content").Children()
			if err == nil {
				for _, z := range cz {
					s := blueprint.Structure{
						Required: isContains("attributes.typeAttributes", "required", z),
						Key:      z.Path("content.key.content").String(),
						Value:    z.Path("content.value.content").String(),
						Kind:     z.Path("content.value.element").String(),
					}

					d.Structures = append(d.Structures, s)
				}
			}

			ds = append(ds, d)
		}
	}

	return
}

func digTransitions(el *Element) (ts []blueprint.Transition) {
	children := filterContentByElement("transition", el)

	for _, child := range children {
		t := &blueprint.Transition{
			Title:        child.Path("meta.title").String(),
			Description:  digDescription(child),
			Transactions: digTransactions(child),
		}

		ts = append(ts, *t)
	}

	return
}

func digTransactions(el *Element) (xs []blueprint.Transaction) {
	children := filterContentByElement("httpTransaction", el)

	for _, child := range children {
		cx, err := child.Path("content").Children()
		if err != nil {
			continue
		}

		xs = append(xs, extractTransaction(cx))
	}

	return
}

func extractTransaction(children []*Element) (x blueprint.Transaction) {
	for _, child := range children {
		if child.Path("element").String() == "httpRequest" {
			x.Request = extractRequest(child)
		}

		if child.Path("element").String() == "httpResponse" {
			x.Response = extractResponse(child)
		}
	}

	return
}

func extractRequest(child *Element) (r blueprint.Request) {
	r = blueprint.Request{
		Method:  child.Path("attributes.method").String(),
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
		StatusCode:     extractStatusCode(child),
		Headers:        extractHeaders(child.Path("attributes.headers")),
		DataStructures: digDataStructures(child),
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

	if child.Path("element").String() == "httpHeaders" {
		contents, err := child.Path("content").Children()
		if err != nil {
			return
		}

		for _, content := range contents {
			key := content.Path("content.key.content").String()
			val := content.Path("content.value.content").String()

			h.Set(key, val)
		}

		return
	}

	return
}

func extractHrefs(child *Element) (h blueprint.Href) {
	if child.Path("href").Value().IsValid() {
		h.Path = child.Path("href").String()
	}

	contents, err := child.Path("attributes.hrefVariables.content").Children()
	if err != nil {
		return
	}

	for _, content := range contents {
		v := &blueprint.HVariable{
			Key:         content.Path("content.key.content").String(),
			Value:       content.Path("content.value.content").String(),
			Description: content.Path("meta.description").String(),
		}

		h.Variables = append(h.Variables, *v)
	}

	return
}

func extractStatusCode(child *Element) int {
	var err error

	s := child.Path("attributes.statusCode").String()
	n, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}

	return n
}

func extractAsset(child *Element) (a blueprint.Asset) {
	if child.Path("element").String() == "asset" {
		return blueprint.Asset{
			ContentType: child.Path("attributes.contentType").String(),
			Body:        child.Path("content").String(),
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
