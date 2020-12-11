\documentclass[11pt]{article}
\usepackage{times}
\usepackage{pl}
\usepackage{html}
\sloppy
\makeindex

\onefile
\htmloutput{.}					% Output directory
\htmlmainfile{paxos}				% Main document file
\bodycolor{white}				% Page colour

\begin{document}

\title{Paxos -- a SWI-Prolog replicating key-value store}
\author{Jeffrey Rosenwald and Jan Wielemaker \\
	CWI, Amsterdam \\
	The Netherlands \\
	E-mail: \email{J.Wielemaker@cwi.nl}}

\maketitle

\begin{abstract}
This package provides the library \file{paxos.pl} that implements a
replicating key-value store of Prolog terms on top of SWI-Prolog
\pllib{broadcast} libraries and its TIPC or UDP based extension that
allow broadcasting outside the process using networking.
\end{abstract}

\pagebreak
\tableofcontents

\vfill
\vfill

\newpage

\input{libpaxos.tex}

\printindex

\end{document}

