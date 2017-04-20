package api

import (
	"errors"
	"reflect"
	"strconv"
	"strings"
)

var ErrIsNotSlice = errors.New("is not a slice")

type Element struct {
	object interface{}
}

func (b *Element) Object() interface{} {
	return b.object
}

func (b *Element) Value() reflect.Value {
	return reflect.ValueOf(b.object)
}

func (b *Element) String() string {
	v := b.Value()

	if v.IsValid() {
		switch v.Kind() {
		case reflect.String:
			return v.String()
		case reflect.Float64:
			return strconv.Itoa(int(v.Float()))
		}
	}

	return ""
}

func (b *Element) Path(key string) *Element {
	return b.search(b.hierarchy(key)...)
}

func (b *Element) Exists(key string) bool {
	return b.Path(key).Value().IsNil()
}

func (b *Element) Index(i int) *Element {
	val := b.Value()

	if val.Kind() == reflect.Slice {
		if i >= val.Len() {
			return &Element{nil}
		}

		return &Element{val.Index(i).Interface()}
	}

	return &Element{nil}
}

func (b *Element) Children() ([]*Element, error) {
	val := b.Value()

	switch val.Kind() {
	case reflect.Slice:
		children := make([]*Element, val.Len())
		for i := 0; i < val.Len(); i++ {
			children[i] = &Element{val.Index(i).Interface()}
		}

		return children, nil
	case reflect.Map:
		children := []*Element{}

		for _, key := range val.MapKeys() {
			children = append(children, &Element{val.MapIndex(key).Interface()})
		}

		return children, nil
	}

	return nil, errors.New("is not object or array")
}

func (b *Element) ChildrenMap() (map[string]*Element, error) {
	val := b.Value()

	if val.Kind() == reflect.Map {
		children := map[string]*Element{}

		for _, key := range val.MapKeys() {
			children[key.String()] = &Element{val.MapIndex(key).Interface()}
		}

		return children, nil
	}

	return nil, errors.New("is not an object")
}

func (b *Element) FlatChildren() ([]*Element, error) {
	val := b.Value()

	switch val.Kind() {
	case reflect.Slice:
		children := make([]*Element, 0, val.Len())

		for i := 0; i < val.Len(); i++ {
			childVal := val.Index(i).Elem()

			if nestedChildren, err := (&Element{childVal.Interface()}).FlatChildren(); err == nil {
				children = append(children, nestedChildren...)
			} else if err == ErrIsNotSlice {
				children = append(children, &Element{childVal.Interface()})
			} else {
				return nil, err
			}
		}

		return children, nil
	}

	return nil, ErrIsNotSlice
}

func (b *Element) hierarchy(key string) []string {
	return strings.Split(key, ".")
}

func (b *Element) search(keys ...string) *Element {
	var object interface{}

	object = b.object

	for i := 0; i < len(keys); i++ {
		if bmap, ok := object.(map[string]interface{}); ok {
			object = bmap[keys[i]]
		} else if barr, ok := object.([]interface{}); ok {
			tmpArr := []interface{}{}

			for i := range barr {
				tmpObj := &Element{barr[i]}
				val := tmpObj.search(keys[i:]...).object
				if val != nil {
					tmpArr = append(tmpArr, val)
				}
			}

			if len(tmpArr) == 0 {
				return &Element{nil}
			}

			return &Element{tmpArr}
		} else {
			return &Element{nil}
		}
	}

	return &Element{object}
}
