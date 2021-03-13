## THIS FILE TURNS A FCS FILE INTO A FILE LIKE THE fcsFileXX.tsx IN THIS FOLDER.
#  CHANGE FILES CONFIG BELOW TO GET THE EXPECTED RESULT
 
import fcsparser
path = fcsparser.test_sample_path   # switch this path for any fsc file
                                    # you want to load (string)
meta, data = fcsparser.parse(path, reformat_meta=True)

filePath = './testFile.tsx'
file = open(filePath, 'w')

file.write("""
export default {
\tdimesions: [
""")

i = 0
for v in data.columns:
    s = "key: {}, value: \"{}\", display: \"lin\"".format(i, v)
    file.write("\t\t{ " + s + "},")
    i = i + 1

file.write("""
\t],
\tdata: [
""")


for i in range(len(data)):
    l = "[ "
    for v in data.columns:
        l = l + str(data.loc[i][v]) + ","
    l = l + " ],"
    file.write(l)

file.write("""
  ],
};
""")

file.close()
