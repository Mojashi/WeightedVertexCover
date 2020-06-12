import random
from ortools.linear_solver import pywraplp

from django.core.management.base import BaseCommand
from game.models import Problem

class UnionFind():
    def __init__(self, n):
        self.n = n
        self.parents = [-1] * n

    def find(self, x):
        if self.parents[x] < 0:
            return x
        else:
            self.parents[x] = self.find(self.parents[x])
            return self.parents[x]

    def union(self, x, y):
        x = self.find(x)
        y = self.find(y)

        if x == y:
            return

        if self.parents[x] > self.parents[y]:
            x, y = y, x

        self.parents[x] += self.parents[y]
        self.parents[y] = x

    def size(self, x):
        return -self.parents[self.find(x)]

    def same(self, x, y):
        return self.find(x) == self.find(y)

    def members(self, x):
        root = self.find(x)
        return [i for i in range(self.n) if self.find(i) == root]

    def roots(self):
        return [i for i, x in enumerate(self.parents) if x < 0]

    def group_count(self):
        return len(self.roots())

    def all_group_members(self):
        return {r: self.members(r) for r in self.roots()}

    def __str__(self):
        return '\n'.join('{}: {}'.format(r, self.members(r)) for r in self.roots())
    

def makeProblem(n, p, maxC):
    uf = UnionFind(n)

    problem = {'edges':[], 'vertices':[]}
    for i in range(n):
        for j in range(i + 1,n):
            if random.random() < p:
                problem['edges'].append({'to':i, 'from':j})
                uf.union(i, j)

    while uf.group_count() > 1:
        roots = uf.roots()
        i=0
        j=0
        while i==j:
            i = random.randrange(0, len(roots),1)
            j = random.randrange(0, len(roots),1)
        problem['edges'].append({'to':roots[i], 'from':roots[j]})
        uf.union(roots[i], roots[j])

    for i in range(n):
        problem['vertices'].append({'weight':random.randrange(1, maxC+1, 1)})
    
    return problem


def solve(problem):
    solver = pywraplp.Solver("MIP", pywraplp.Solver.CBC_MIXED_INTEGER_PROGRAMMING)
    v = []
    for i in range(len(problem['vertices'])):
        v.append(solver.IntVar(0, 1,'v'+str(i)))
    
    for ed in problem['edges']:
        constraint = solver.Constraint(1, solver.infinity())
        constraint.SetCoefficient(v[ed['from']], 1)
        constraint.SetCoefficient(v[ed['to']], 1)

    objective = solver.Objective()
    for i in range(len(problem['vertices'])):
        objective.SetCoefficient(v[i], problem['vertices'][i]['weight'])
    objective.SetMinimization()

    solver.Solve()
    answer = []
    for i in range(len(problem['vertices'])):
        answer.append(int(v[i].solution_value()))
    return {'OPT':solver.Objective().Value(), 'OPTSolution':answer}

class Command(BaseCommand):
    # python manage.py help count_entryで表示されるメッセージ
    help = 'Make and add new problem'

    # コマンドライン引数を指定します。(argparseモジュール https://docs.python.org/2.7/library/argparse.html)
    # 今回はblog_idという名前で取得する。（引数は最低でも1個, int型）
    def add_arguments(self, parser):
        parser.add_argument('numOfProblem', nargs=1, type=int)
        parser.add_argument('numOfVerticesL', nargs=1, type=int)
        parser.add_argument('numOfVerticesR', nargs=1, type=int)
        parser.add_argument('EdgeCoeffL', nargs=1, type=int)
        parser.add_argument('EdgeCoeffR', nargs=1, type=int)
        parser.add_argument('maxCost', nargs=1, type=int)

    # コマンドが実行された際に呼ばれるメソッド
    def handle(self, *args, **options):
        for i in range(options['numOfProblem'][0]):
            while True:
                n = random.randrange(options['numOfVerticesL'][0], options['numOfVerticesR'][0],1)
                problem = makeProblem(n, random.randrange(options['EdgeCoeffL'][0], options['EdgeCoeffR'][0],1)*n*1.0 / (n * (n-1) / 2), options['maxCost'][0])
                answer = solve(problem)
                if answer is not None:
                    p = Problem()
                    p.problem = problem
                    p.OPT = answer['OPT']
                    p.OPTSolution = answer['OPTSolution']
                    p.save()
                    self.stdout.write(self.style.SUCCESS('Problem added n='+str(n) + ' m='+str(len(problem['edges']))))
                    break
