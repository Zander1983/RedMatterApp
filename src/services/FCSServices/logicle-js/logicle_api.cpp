#include "logicle_api.h"
#include <node.h>
#include <uv.h>
#include <nan.h>
#include <cstring>
#include <vector>
#include "transform_functions.h"
using namespace Nan;
using namespace v8;
using namespace std;


std::string getStringFromObj(const Local<Object> obj, const char *name)
{
	Local<String> key = Nan::New<String>(name).ToLocalChecked();
	Local<Value> value = Nan::Get(obj, key).ToLocalChecked();
	return *(Nan::Utf8String(value));
}

int getIntFromObj(const Local<Object> obj, const char *name)
{
	Local<String> key = Nan::New<String>(name).ToLocalChecked();
	Local<Value> value = Nan::Get(obj, key).ToLocalChecked();
	return Nan::To<int>(value).FromJust();
}

double getDoubleFromObj(const Local<Object> obj, const char *name)
{
	Local<String> key = Nan::New<String>(name).ToLocalChecked();
	Local<Value> value = Nan::Get(obj, key).ToLocalChecked();
	return Nan::To<double>(value).FromJust();
}

vector<double> getDoubleArrayFromObj(const Local<Object> obj, const char *name)
{
	Local<String> key = Nan::New<String>(name).ToLocalChecked();
	Local<Array> array = Local<Array>::Cast(Nan::Get(obj, key).ToLocalChecked());
	int length = array->Length();
	vector<double> res(length);
	for (int i = 0; i < length; ++i) {
		Local<Value> value = Nan::Get(array, i).ToLocalChecked();
		res[i] = Nan::To<double>(value).FromJust();
	}
	return res;
}

NAN_METHOD(api_logicle_transform)
{
	Local<Object> obj = info[0]->ToObject(Nan::GetCurrentContext())
						.ToLocalChecked();
	vector<double> x = getDoubleArrayFromObj(obj, "x");
	double T = getDoubleFromObj(obj, "T");
	double M = getDoubleFromObj(obj, "M");
	double A = getDoubleFromObj(obj, "A");
	double W = getDoubleFromObj(obj, "W");
	int inverse = getIntFromObj(obj, "inverse");
	vector<double> res;
	try {
		res = logicle_transform(x, T, W, M, A, inverse);
	}
	catch (const char *err) {
		Local<String> err_string = Nan::New<String>(err).ToLocalChecked();
		info.GetReturnValue().Set(err_string);
		return;
	}
	Local<v8::Array> array = New<v8::Array>(res.size());
	for (unsigned long int i = 0; i < res.size(); ++i)
		Nan::Set(array, (uint32_t) i, Nan::New(res[i]));
	info.GetReturnValue().Set(array);
}

NAN_METHOD(api_hyperlog_transform)
{
	Local<Object> obj = info[0]->ToObject(Nan::GetCurrentContext())
						.ToLocalChecked();
	vector<double> x = getDoubleArrayFromObj(obj, "x");
	double T = getDoubleFromObj(obj, "T");
	double M = getDoubleFromObj(obj, "M");
	double A = getDoubleFromObj(obj, "A");
	double W = getDoubleFromObj(obj, "W");
	int inverse = getIntFromObj(obj, "inverse");
	vector<double> res;
	try {
		res = hyperlog_transform(x, T, W, M, A, inverse);
	}
	catch (const char *err) {
		Local<String> err_string = Nan::New<String>(err).ToLocalChecked();
		info.GetReturnValue().Set(err_string);
		return;
	}
	Local<v8::Array> array = New<v8::Array>(res.size());
	for (unsigned long int i = 0; i < res.size(); ++i)
		Nan::Set(array, (uint32_t) i, Nan::New(res[i]));
	info.GetReturnValue().Set(array);
}

NAN_METHOD(api_fast_logicle_transform)
{
	Local<Object> obj = info[0]->ToObject(Nan::GetCurrentContext())
						.ToLocalChecked();
	vector<double> x = getDoubleArrayFromObj(obj, "x");
	double T = getDoubleFromObj(obj, "T");
	double M = getDoubleFromObj(obj, "M");
	double A = getDoubleFromObj(obj, "A");
	double W = getDoubleFromObj(obj, "W");
	int inverse = getIntFromObj(obj, "inverse");
	vector<double> res;
	try {
		res = fastlogicle_transform(x, T, W, M, A, inverse);
	}
	catch (const char *err) {
		Local<String> err_string = Nan::New<String>(err).ToLocalChecked();
		info.GetReturnValue().Set(err_string);
		return;
	}
	Local<v8::Array> array = New<v8::Array>(res.size());
	for (unsigned long int i = 0; i < res.size(); ++i)
		Nan::Set(array, (uint32_t) i, Nan::New(res[i]));
	info.GetReturnValue().Set(array);
}

NAN_METHOD(api_get_percentile)
{
	Local<Object> obj = info[0]->ToObject(Nan::GetCurrentContext())
						.ToLocalChecked();
	vector<double> x = getDoubleArrayFromObj(obj, "x");
	double percentile = getDoubleFromObj(obj, "percentile");
	double res;
	try {
		res = get_percentile(x, percentile);
	}
	catch (const char *err) {
		Local<String> err_string = Nan::New<String>(err).ToLocalChecked();
		info.GetReturnValue().Set(err_string);
		return;
	}
	Local<Value> value = Nan::New(res);
	info.GetReturnValue().Set(value);
}

NAN_MODULE_INIT(Init)
{
	DECL_API("logicle_transform", api_logicle_transform);

	DECL_API("hyperlog_transform", api_hyperlog_transform);

	DECL_API("fast_logicle_transform", api_fast_logicle_transform);

	DECL_API("get_percentile", api_get_percentile);
}

NODE_MODULE(logicle_api, Init);

