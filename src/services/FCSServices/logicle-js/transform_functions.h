#ifndef __LOGICLE_TRANSFORM__
#define __LOGICLE_TRANSFORM__
#include <vector>
std::vector<double> logicle_transform(std::vector<double> input, double T,
					double W, double M, double A,
					bool isInverse=false);

std::vector<double> hyperlog_transform(std::vector<double> input, double T,
					double W, double M, double A,
					bool isInverse);

std::vector<double> fastlogicle_transform(std::vector<double> input, double T,
						double W, double M, double A,
						bool isInverse);

double get_percentile(std::vector<double> input, double percentile);
#endif
