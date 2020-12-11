cmake_minimum_required(VERSION 3.5)
project(swipl-paxos)

include("../cmake/PrologPackage.cmake")

swipl_plugin(paxos
	     PL_LIBS paxos.pl)

pkg_doc(paxos
	SECTION
	SOURCE paxos.pl libpaxos.tex)
