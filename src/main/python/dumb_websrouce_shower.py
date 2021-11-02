import newspaper
import json
from subprocess import Popen, PIPE

SOURCES = '../../resources/sources.json'
INTERESTS = '../../resources/interests.json'

with open(SOURCES, "r") as s:
    sources = json.loads(s.read())
    for source in sources:
        process = Popen(['firefox', source['url']], stdout=PIPE, stderr=PIPE)
