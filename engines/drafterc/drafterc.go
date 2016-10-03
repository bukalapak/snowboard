package drafterc

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/ioutil"
	"os/exec"
	"strings"

	version "github.com/hashicorp/go-version"
)

const minimumVersion = "2.0.1"

type Engine struct{}

func (c Engine) Parse(r io.Reader) ([]byte, error) {
	var stdOut bytes.Buffer

	err := c.exec(r, &stdOut, ioutil.Discard, "--format", "json", "--type", "refract")
	if err != nil {
		return nil, err
	}

	return stdOut.Bytes(), nil
}

func (c Engine) Validate(r io.Reader) ([]byte, error) {
	var stdErr bytes.Buffer

	err := c.exec(r, ioutil.Discard, &stdErr, "--validate")
	if err != nil {
		return nil, err
	}

	return stdErr.Bytes(), nil
}

func (c Engine) Version() (m map[string]string) {
	path, err := command()
	if err != nil {
		return
	}

	cmd := exec.Command(path, "--version")
	b, err := cmd.Output()
	if err != nil {
		return
	}

	return map[string]string{
		"drafter command line": strings.TrimSpace(string(b)),
	}
}

func (c Engine) exec(r io.Reader, stdOut, stdErr io.Writer, args ...string) error {
	path, err := command()
	if err != nil {
		return err
	}

	err = c.checkVersion()
	if err != nil {
		return err
	}

	b, err := ioutil.ReadAll(r)
	if err != nil {
		return err
	}

	buf := bytes.NewReader(b)
	cmd := exec.Command(path, args...)
	cmd.Stdin = buf
	cmd.Stdout = stdOut
	cmd.Stderr = stdErr

	return cmd.Run()
}

func (c Engine) checkVersion() error {
	for _, v := range c.Version() {
		err := compareVersion(v)
		if err != nil {
			return err
		}
	}

	return nil
}

func command() (string, error) {
	path, err := exec.LookPath("drafter")
	if err != nil {
		return "", errors.New("Couldn't find drafter. Please install it first https://github.com/apiaryio/drafter")
	}

	return path, nil
}

func compareVersion(v string) error {
	cv := strings.TrimPrefix(v, "v")
	mv, _ := version.NewVersion(minimumVersion)
	ov, err := version.NewVersion(cv)
	if err != nil {
		return err
	}

	if ov.LessThan(mv) {
		return fmt.Errorf("You are using drafter version %s. Minimum version should be %s", ov, mv)
	}

	return nil
}
