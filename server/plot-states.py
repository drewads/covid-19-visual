#!/usr/bin/env python
# coding: utf-8

# In[ ]:


import numpy as np
import matplotlib.pyplot as plt
from textwrap import wrap

totalPlot = '../data/plots/{}Total.png'
newPlot = '../data/plots/{}New.png'
recentFile = '../data/recent-state-data.csv'
nationalDataFile = '../data/us-states.csv'


# In[ ]:


def determineStates(nationalData):
    states = set()
    fips = dict()
    for row in nationalData:
        stateName = row[1].decode('UTF-8')
        states.add(stateName)
        fips[stateName] = row[2]

    states = list(states)
    states.sort()
    return states, fips


# In[ ]:


def stateCondition(state, nationalData, fips):
    fipsCode = fips[state]
    return [row['fips'] == fipsCode for row in nationalData]

def getCol(strucArray, col):
    return np.array([row[col] for row in strucArray])


# In[ ]:


def plotTotal(state, nationalData, fips):
    stateData = np.extract(stateCondition(state, nationalData, fips), nationalData)
    dates = getCol(stateData, 'date')
    cases = getCol(stateData, 'cases')
    deaths = getCol(stateData, 'deaths')

    plt.figure()
    plt.plot(dates, cases)
    plt.plot(dates, deaths)
    locs, labels = plt.xticks()
    newLocs = [locs[0], locs[-1]//4, locs[-1]//2, (locs[-1]*3)//4, locs[-1]]
    plt.xticks(newLocs)
    plt.fill_between(dates, cases, alpha=0.9)
    plt.fill_between(dates, deaths, alpha=0.9)
    plt.title('\n'.join(wrap('Total COVID-19 Cases and Deaths in {}'.format(state), 54)))
    plt.xlabel('Date')
    plt.legend(['Total Cases ({})'.format(cases[-1]), 'Deaths ({})'.format(deaths[-1])])
    plt.savefig(totalPlot.format(state))
    plt.close()


# In[ ]:


def prevDate(date):
    dateArray = date.split('-')
    dateArray = [int(i) for i in dateArray]
    dateArray[2] -= 1
    
    if dateArray[2] == 0:
        dateArray[1] -= 1
        if dateArray[1] == 0:
            dateArray[1] = 12
            dateArray[0] -= 1
            
        if dateArray[1] in (1, 3, 5, 7, 8, 10, 12):
            dateArray[2] = 31
        elif dateArray[1] in (4, 6, 9, 11):
            dateArray[2] = 30
        elif (dateArray[0] % 4) == 0:
            dateArray[2] = 29
        else:
            dateArray[2] = 28
    
    leadingZero = [i // 10 == 0 for i in dateArray]
    dateArray = [str(i) for i in dateArray]
    for i in range(len(dateArray)):
        if leadingZero[i]:
            dateArray[i] = '0{}'.format(dateArray[i])
    date = '{}-{}-{}'.format(dateArray[0], dateArray[1], dateArray[2])
    return date


# In[ ]:


def extractRecentData(dates, cases, deaths):
    info = [0] * 9
    info[8] = deaths[-1]
    info[5] = cases[-1]
    info[2] = dates[-1].decode('UTF-8')
    info[1] = prevDate(info[2])
    info[0] = prevDate(info[1])
    
    if dates.size > 1:
        info[7] = deaths[-2]
        info[4] = cases[-2]
        
    if dates.size > 2:
        info[6] = deaths[-3]
        info[3] = cases[-3]
        
    return info


# In[ ]:


def plotNew(state, nationalData, fips):
    stateData = np.extract(stateCondition(state, nationalData, fips), nationalData)
    dates = getCol(stateData, 'date')
    cases = getCol(stateData, 'cases')
    deaths = getCol(stateData, 'deaths')
    
    totCases = np.insert(cases, 0, [0])
    totDeaths = np.insert(deaths, 0, [0])
    
    for i in range(len(dates)):
        cases[i] = totCases[i+1] - totCases[i]
        deaths[i] = totDeaths[i+1] - totDeaths[i]
        
    plt.figure()
    plt.bar(dates, cases, alpha=.9)
    plt.bar(dates, deaths, alpha=.9)
    locs, labels = plt.xticks()
    newLocs = [locs[0], locs[-1]//4, locs[-1]//2, (locs[-1]*3)//4, locs[-1]]
    plt.xticks(newLocs)
    plt.title('\n'.join(wrap('New COVID-19 Cases and Deaths Every Day in {}'.format(state), 54)))
    plt.xlabel('Date')
    plt.legend(['New Cases ({})'.format(cases[-1]), 'New Deaths ({})'.format(deaths[-1])])
    plt.savefig(newPlot.format(state))
    plt.close()
    
    info = extractRecentData(dates, cases, deaths)
    
    # last three days, new cases, and new deaths
    return '{},{},{},{},{},{},{},{},{}'.format(*info)


# In[ ]:


def plotStates(nationalData):
    fileStr = ''
    states, fips = determineStates(nationalData)
    
    for state in states:
        plotTotal(state, nationalData, fips)
        fileStr += '{},{}'.format(state, plotNew(state, nationalData, fips))
        if (state != states[-1]):
            fileStr += '\n'
    
    file = open(recentFile, 'w')
    file.write(fileStr)
    file.close()


# In[ ]:


nationalData = np.genfromtxt(nationalDataFile, dtype=[('date', "|S10"), ('state', "|S24"), ('fips', int), ('cases', int), ('deaths', int)], delimiter=',')
nationalData = nationalData[1:]

plotStates(nationalData)


# In[ ]:




