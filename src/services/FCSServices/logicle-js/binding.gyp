{
	"targets": [{
		"target_name": "logicle",
		"sources": [
			"logicle.cpp",
			"hyperlog.cpp",
			"fast_logicle.cpp",
			"transform_functions.cpp",
			"logicle_api.cpp"
		],
		"cflags!": [ '-fno-exceptions' ],
		"cflags_cc!": [ '-fno-exceptions' ],
		"cflags": [ '-fPIC', '-fexceptions', '-Wno-unused-result', '-Wconversion', '-Wall'],
		"include_dirs": [
			"<!(node -e \"require('nan')\")"
		],
		"conditions": [
				['OS=="win"', {
					"libraries": ["-lws2_32", "-lshlwapi"]
					}],
				['OS=="mac"',  {
					"xcode_settings": {
						'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
					}
				}]
			]}
		]
}
