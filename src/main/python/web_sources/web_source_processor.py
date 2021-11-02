import newspaper
import json

def process_source(url):
    article = newspaper.Article(url)
    article.download()
    article.parse()
    article.nlp()
    
    print(article.summary)
    return article
    #article.authors
    #article.publish_date
    #article.text
    #article.top_image
    #article.movies
    #article.keywords
    #article.summary
    
def process_aggregate(sources):
    print("Processing source")
    print(sources)
    aggregated = newspaper.build(sources['url'])
    result = []
    
    print("Articles %d Category URls %d" % (len(aggregated.articles),len(aggregated.category_urls())))
    
    for article in aggregated.articles:
        result.append(process_source(article.url))
    
    return result
    #for category in cnn_paper.category_urls():
    #    print(category)

SOURCES = '../../../resources/sources.json'
INTERESTS = '../../../resources/interests.json'

with open(SOURCES, "r") as s:
    sources = json.loads(s.read())
    for source in sources:
        articles = process_aggregate(source)
        #print(articles)
        #print(cat_urls)
        for article in articles:
    	    print(article.summary)
