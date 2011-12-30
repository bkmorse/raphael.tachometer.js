task :minify do
  sh 'rm raphael.tachometer.min.js'
  sh 'juicer merge -s raphael.tachometer.js raphael.tachometer.min.js'
end

task :default => :minify
