package drafterc

//go:generate esc -private -o cli.go -pkg drafterc ../drafter/ext/drafter/bin

import (
	"bytes"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"strings"
)

const Version = "v3.2.6"

type Engine struct{}

func (c Engine) Validate(r io.Reader) ([]byte, error) {
	var stdErr bytes.Buffer

	err := c.exec(r, ioutil.Discard, &stdErr, "--validate", "--use-line-num")
	if err != nil {
		return nil, err
	}

	s := strings.Replace(stdErr.String(), "OK.", "", 1)
	s = strings.TrimSpace(s)

	return []byte(s), nil
}

func (c Engine) exec(r io.Reader, stdOut, stdErr io.Writer, args ...string) error {
	b, err := ioutil.ReadAll(r)
	if err != nil {
		return err
	}

	x, tmp, err := c.command()
	if err != nil {
		return err
	}

	if tmp {
		defer func() {
			os.Remove(x)
		}()
	}

	buf := bytes.NewReader(b)
	cmd := exec.Command(x, args...)
	cmd.Stdin = buf
	cmd.Stdout = stdOut
	cmd.Stderr = stdErr

	return cmd.Run()
}

func (c Engine) command() (string, bool, error) {
	if path, err := exec.LookPath("drafter"); err == nil {
		if v := version(path); v == Version {
			return path, false, nil
		}
	}

	path, err := tmpCommand()
	return path, true, err
}

func tmpCommand() (string, error) {
	b, err := _escFSByte(false, "/drafter/ext/drafter/bin/drafter")
	if err != nil {
		return "", err
	}

	tmp, err := ioutil.TempFile(os.TempDir(), "drafterc")
	if err != nil {
		return "", err
	}

	tmp.Write(b)
	tmp.Chmod(0700)
	tmp.Close()

	return tmp.Name(), nil
}

func version(path string) string {
	cmd := exec.Command(path, "--version")
	b, err := cmd.Output()
	if err != nil {
		return ""
	}

	return strings.TrimSpace(string(b))
}
