#!/usr/bin/env ruby
# Local development server - bypasses GitHub API calls that cause hangs
$stdout.sync = true
require "jekyll"

options = Jekyll.configuration({
  "source" => File.dirname(File.expand_path(__FILE__)),
  "github" => nil,
  "serving" => true,
  "watch" => true,
  "host" => "127.0.0.1",
  "port" => 4000
})

site = Jekyll::Site.new(options)
site.process

puts "    Server address: http://127.0.0.1:4000"
puts "  Server running... press ctrl-c to stop."

require "webrick"
server = WEBrick::HTTPServer.new(
  Port: 4000,
  BindAddress: "127.0.0.1",
  DocumentRoot: site.dest
)

trap("INT") { server.shutdown }
trap("TERM") { server.shutdown }
server.start
