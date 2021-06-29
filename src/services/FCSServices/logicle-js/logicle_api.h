#ifndef __LOGICLE_API__
#define __LOGICLE_API__
#define DECL_API(name, func) Nan::Set(target, Nan::New<String>(name).ToLocalChecked(),\
				Nan::GetFunction(Nan::New<FunctionTemplate>(func)).ToLocalChecked());
#endif

