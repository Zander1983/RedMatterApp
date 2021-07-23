#include "transform_functions.h"
#include <cmath>
#include <string>
#include <algorithm>
#include "logicle.h"
#include "hyperlog.h"
using namespace std;
/**
 * Logicle tranform/inverse transform wrapper function, makes use of the Logicle
 *  class provided Wayne Moore for the underlying calculation of the transformation.
 *
 * */
std::vector<double> logicle_transform(std::vector<double> input, double T,
					double W, double M, double A,
					bool isInverse)
{
	long unsigned int nLen = input.size();
	Logicle lg = Logicle(T, W, M, A);
	for (long unsigned int i = 0; i < nLen; i++) {
		if(std::isnan(input.at(i)))
			continue;
		if(isInverse)
			input.at(i) = lg.inverse(input.at(i));
		else
			input.at(i) = lg.scale(input.at(i));
	}
	return(input);
}

/**
  Hyperlog transformation added by Josef Spidlen.
  This hyperlog implementation is based on Java reference 
  implementation that is part of the full Gating-ML 2.0
  specification. The Java reference implementation has
  been provided by Wayne Moore, see hyperlog.notice.html
  for details. Josef Spidlen ported it to C/CPP and 
  integrated it with R/flowCore.
*/
/**
 * Hyperlog tranform/inverse transform wrapper function, makes use of the Hyperlog
 * class adapted from Wayne Moore's Java Hyperlog implementation for the underlying
 * calculation of the transformation.
 **/
//[[Rcpp::export]]
std::vector<double> hyperlog_transform(std::vector<double> input, double T,
					double W, double M, double A,
					bool isInverse)
{
	long unsigned int nLen = input.size();
	Hyperlog lg = Hyperlog(T, W, M, A);
	for (unsigned i = 0; i < nLen; i++) {
		if(isInverse)
			input.at(i) = lg.inverse(input.at(i));
		else
			input.at(i) = lg.scale(input.at(i));
	}
	return(input);
}

std::vector<double> fastlogicle_transform(std::vector<double> input, double T,
						double W, double M, double A,
						bool isInverse)
{
	long unsigned int nLen = input.size();
	Logicle lg = FastLogicle(T, W, M, A);
	for (long unsigned int i = 0; i < nLen; i++) {
		if(std::isnan(input.at(i)))
			continue;
		if(isInverse)
			input.at(i) = lg.inverse(input.at(i));
		else
			input.at(i) = lg.scale(input.at(i));
	}
	return(input);
}

double get_percentile(std::vector<double> input, double percentile)
{
	if (percentile < 0 || percentile > 100)
		throw "IllegalParameter: percentile is either less than 0 or greater than 100";
	percentile /= 100;
	std::sort(input.begin(), input.end());
	for (unsigned long int i = 0; i < input.size(); ++i) {
		if (i + 1 == input.size() || input[i] != input[i + 1]) {
			if (double(i + 1) >= percentile * double(input.size()))
				return input[i];
		}
	}
	return input.back();
}

