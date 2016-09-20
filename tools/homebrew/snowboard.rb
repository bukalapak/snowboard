require 'formula'

class Snowboard < Formula
  homepage 'https://subosito.com/'
  head 'https://github.com/subosito/snowboard.git'

  depends_on 'go' => :build

  def install
    ENV['GOPATH'] = buildpath

    pkgpath = buildpath/"src/github.com/subosito/snowboard"
    pkgpath.install Dir["*"]

    cd pkgpath do
      system 'make', 'build'
      bin.install 'snowboard'
    end
  end
end
