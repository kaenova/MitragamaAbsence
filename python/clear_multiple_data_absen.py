import pandas as pd 
import sys

path = sys.argv[1]
df = pd.read_csv(path)
result_df = df.drop_duplicates(subset=['nama'], keep='first')
result_df.to_csv(path) 