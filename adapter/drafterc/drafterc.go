package drafterc

//go:generate esc -private -o cli.go -pkg drafterc ../drafter/ext/drafter/bin

import (
	"bytes"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/bukalapak/snowboard/adapter/drafter"
)

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

	err := c.exec(r, ioutil.Discard, &stdErr, "--validate", "--use-line-num")
	if err != nil && !strings.Contains(err.Error(), "exit status") {
		return nil, err
	}

	s := strings.Replace(stdErr.String(), "OK.", "", 1)
	s = strings.TrimSpace(s)

	return []byte(s), nil
}

func (c Engine) Version() string {
	var stdOut bytes.Buffer

	err := c.exec(strings.NewReader(""), &stdOut, ioutil.Discard, "--version")
	if err != nil {
		return ""
	}

	return strings.TrimSpace(stdOut.String())
}

func (c Engine) CopyExec(dir string) (string, error) {
	b := embeddedExec()
	name := filepath.Join(dir, "drafter")
	err := ioutil.WriteFile(name, b, 0755)

	return name, err
}

func (c Engine) exec(r io.Reader, stdOut, stdErr io.Writer, args ...string) error {
	x, tmp, err := c.command()
	if err != nil {
		return err
	}

	if tmp {
		defer func() {
			os.Remove(x)
		}()
	}

	cmd := exec.Command(x, args...)
	cmd.Stdin = r
	cmd.Stdout = stdOut
	cmd.Stderr = stdErr

	return cmd.Run()
}

func (c Engine) command() (string, bool, error) {
	if path, err := exec.LookPath("drafter"); err == nil {
		if v := version(path); v == drafter.Version {
			return path, false, nil
		}
	}

	path, err := tmpCommand()
	return path, true, err
}

func tmpCommand() (string, error) {
	b := embeddedExec()
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

func embeddedExec() []byte {
	return _escFSMustByte(false, "/drafter/ext/drafter/bin/drafter")
}
