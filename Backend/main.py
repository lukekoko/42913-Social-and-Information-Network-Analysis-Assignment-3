from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ratings = pd.read_csv('./data/ratings.csv')
movies = pd.read_csv('./data/movies.csv')
# posters = pd.read_csv('./data/posters.csv')
# movies = movies.merge(posters, how='left', on='movieId')
# print(movies.head())
data = ratings.merge(movies,on='movieId', how='left') # merged ratings and movies

# getting average rating and count of ratings
data_stat = pd.DataFrame(data.groupby('title')['rating'].mean())
data_stat["Total_ratings"] = pd.DataFrame(data.groupby('title')['rating'].count())

avg_rating = pd.DataFrame({'Mean_ratings' : data.groupby("title")['rating'].mean(), 'Total_ratings': data.groupby('title')['rating'].count()}).reset_index()
avg_rating = avg_rating.sort_values('Total_ratings',ascending=False).reset_index()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/movies")
def read_movies():
    # print(movies.to_dict("records"))
    return {"movies": movies.to_dict("records")}

@app.get("/movies/stat")
def read_movies_stat():
    return {"movies": avg_rating.head(1000).to_dict("records")}

@app.get("/recommend/{movie}")
def recommendation(movie: str):
    try:
        # pivot table to create matrix of users and movie ratings.
        pivot = data.pivot_table(index='userId',columns='title',values='rating')
        pivot = pivot[pivot.get(movie).notnull()] # remove null ratings
        correlations = pivot.corrwith(pivot[movie]) # get correlations

        # create new table with correlations of movie to other movies
        recommendation = pd.DataFrame(correlations,columns=['Correlation'])
        recommendation.fillna(0, inplace = True )
        recommendation = recommendation.join(data_stat['Total_ratings'])

        # sort by highest correlation and filter by movies with ratings above 100
        recommendation = recommendation[recommendation['Total_ratings']>100].sort_values('Correlation',ascending=False).reset_index()
        recommendation = recommendation.merge(movies,on='title', how='left')
        recommendation = recommendation.iloc[1:]
        return {"recommendations": recommendation.head(5).to_dict('records')}
    except Exception as e:
        return {"error": e}