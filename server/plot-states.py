import numpy as np
import matplotlib.pyplot as plt

totalPlot = '../data/plots/{}Total.png'
newPlot = '../data/plots/{}New.png'
recentFile = '../data/recent-state-data.csv'
nationalDataFile = '../data/us-states.csv'

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

def stateCondition(state, nationalData, fips):
    fipsCode = fips[state]
    return [row['fips'] == fipsCode for row in nationalData]

def getCol(strucArray, col):
    return np.array([row[col] for row in strucArray])

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
    plt.title('Total COVID-19 Cases and Deaths in {}'.format(state))
    plt.xlabel('Date')
    plt.legend(['Total Cases ({})'.format(cases[-1]), 'Deaths ({})'.format(deaths[-1])])
    plt.savefig(totalPlot.format(state))
    plt.close()

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
    plt.title('New COVID-19 Cases and Deaths Every Day in {}'.format(state))
    plt.xlabel('Date')
    plt.legend(['New Cases ({})'.format(cases[-1]), 'New Deaths ({})'.format(deaths[-1])])
    plt.savefig(newPlot.format(state))
    plt.close()
    
    # last three days, new cases, and new deaths
    return '{},{},{},{},{},{},{},{},{}'.format(dates[-3].decode('UTF-8'), dates[-2].decode('UTF-8'), dates[-1].decode('UTF-8'), cases[-3], cases[-2], cases[-1], deaths[-3], deaths[-2], deaths[-1])
    
    # last three days, new cases, and new deaths
    return '{},{},{},{},{},{},{},{},{}'.format(dates[-3].decode('UTF-8'), dates[-2].decode('UTF-8'), dates[-1].decode('UTF-8'), cases[-3], cases[-2], cases[-1], deaths[-3], deaths[-2], deaths[-1])

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

nationalData = np.genfromtxt(nationalDataFile, dtype=[('date', "|S10"), ('state', "|S20"), ('fips', int), ('cases', int), ('deaths', int)], delimiter=',')
nationalData = nationalData[1:]

plotStates(nationalData)