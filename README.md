# ECE461 Team Project Phase 1

## Team Members:

Adam Kahl,
Leyton Bostre,
Anish Sudini,
Blake Neely

## Index

1. [Purpose](#purpose)
1. [Configuration](#configuration)
1. [Usage](#usage)

## Purpose

The project involves creating a command-line tool to help ACME Corporation's teams evaluate Node.js modules based on
metrics like ramp-up time, correctness, bus factor, responsiveness, and license compatibility. The tool will calculate
these metrics in parallel for improved performance and ensure compatibility with ACME's GNU LGPL v2.1 license. Future
plans include transitioning the tool into a web service.

## Configuration

To use our project, please install the dependencies first. This can be done with the following command.

```zsh 
./run install
```

## Usage

Using our project is simple. Before testing repositories please make sure that you have installed the dependencies.
To test repositories, you can use the following command.

```zsh 
./run test.txt
```

The test.txt can be freely edited as you wish.

To run our test suite, you may use the following command:

```zsh 
./run test
```

